import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Shippo from 'shippo';
import { PrismaService } from '../../prisma.service';

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateShipmentDto {
  orderId: string;
  carrier: 'USPS' | 'FedEx' | 'UPS';
  service: 'PRIORITY' | 'EXPRESS' | 'GROUND';
  customerName: string;
  shippingAddress: ShippingAddress;
}

@Injectable()
export class ShippoService {
  private readonly logger = new Logger(ShippoService.name);
  private shippo: Shippo | null = null;
  private readonly isConfigured: boolean;

  constructor(private prisma: PrismaService) {
    // Initialize Shippo if API key is configured
    if (process.env.SHIPPO_API_KEY) {
      this.shippo = new Shippo({
        apiKeyHeader: process.env.SHIPPO_API_KEY,
      });
      this.isConfigured = true;
      this.logger.log('Shippo service initialized');
    } else {
      this.isConfigured = false;
      this.logger.warn('Shippo API key not configured - service disabled');
    }
  }

  /**
   * Create a shipping label via Shippo
   */
  async createShipment(dto: CreateShipmentDto) {
    if (!this.isConfigured || !this.shippo) {
      throw new BadRequestException('Shippo is not configured');
    }

    // Verify order exists and is PAID
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'PAID') {
      throw new BadRequestException('Order must be PAID before shipping');
    }

    try {
      // Create shipment in Shippo
      const shipment = await this.shippo.shipments.create({
        addressFrom: process.env.SHIPPO_RETURN_ADDRESS_ID || {
          name: 'MAHA Peptides',
          street1: '123 Warehouse St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
        },
        addressTo: {
          name: dto.customerName,
          street1: dto.shippingAddress.line1,
          street2: dto.shippingAddress.line2 || '',
          city: dto.shippingAddress.city,
          state: dto.shippingAddress.state,
          zip: dto.shippingAddress.postalCode,
          country: dto.shippingAddress.country,
        },
        parcels: [
          {
            length: '10',
            width: '8',
            height: '4',
            distanceUnit: 'in',
            weight: '1',
            massUnit: 'lb',
          },
        ],
        async: false,
      });

      // Get rates and select appropriate service
      const rates = shipment.rates || [];
      const selectedRate = this.selectRate(rates, dto.carrier, dto.service);

      if (!selectedRate) {
        throw new BadRequestException(
          `No ${dto.carrier} ${dto.service} rate available`
        );
      }

      // Purchase shipping label
      const transaction = await this.shippo.transactions.create({
        rate: selectedRate.objectId!,
        labelFileType: 'PDF',
        async: false,
      });

      // Create shipment record in database
      const dbShipment = await this.prisma.shipment.create({
        data: {
          orderId: dto.orderId,
          carrier: dto.carrier,
          service: dto.service,
          trackingNumber: transaction.trackingNumber!,
          labelUrl: transaction.labelUrl!,
          shippoId: transaction.objectId!,
          estimatedDelivery: transaction.eta
            ? new Date(transaction.eta)
            : undefined,
        },
      });

      // Update order status to SHIPPED
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: 'SHIPPED' },
      });

      this.logger.log(
        `Created shipment for order ${dto.orderId}: ${transaction.trackingNumber}`
      );

      return {
        shipmentId: dbShipment.id,
        trackingNumber: transaction.trackingNumber,
        labelUrl: transaction.labelUrl,
        carrier: dto.carrier,
        service: dto.service,
        estimatedDelivery: transaction.eta,
      };
    } catch (error) {
      this.logger.error(`Failed to create shipment: ${error.message}`, error.stack);
      throw new BadRequestException(`Shipping label creation failed: ${error.message}`);
    }
  }

  /**
   * Track a shipment by tracking number
   */
  async trackShipment(trackingNumber: string) {
    if (!this.isConfigured || !this.shippo) {
      throw new BadRequestException('Shippo is not configured');
    }

    try {
      const track = await this.shippo.tracks.create({
        carrier: 'usps',
        trackingNumber,
      });

      return {
        trackingNumber: track.trackingNumber,
        carrier: track.carrier,
        status: track.trackingStatus?.status,
        statusDetails: track.trackingStatus?.statusDetails,
        eta: track.eta,
        trackingHistory: track.trackingHistory,
      };
    } catch (error) {
      this.logger.error(`Failed to track shipment: ${error.message}`);
      throw new BadRequestException(`Tracking failed: ${error.message}`);
    }
  }

  /**
   * Get shipment details from database
   */
  async getShipment(shipmentId: string) {
    return this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
          },
        },
      },
    });
  }

  /**
   * Select appropriate shipping rate from Shippo response
   */
  private selectRate(rates: any[], carrier: string, service: string) {
    // Map service names to Shippo service levels
    const serviceMap: Record<string, string[]> = {
      PRIORITY: ['Priority', 'Priority Mail', '2-Day'],
      EXPRESS: ['Express', 'Next Day', 'Overnight'],
      GROUND: ['Ground', 'Standard', 'Economy'],
    };

    const serviceKeywords = serviceMap[service] || [];

    return rates.find((rate) => {
      const matchesCarrier = rate.provider
        ?.toLowerCase()
        .includes(carrier.toLowerCase());
      const matchesService = serviceKeywords.some((keyword) =>
        rate.servicelevel?.name?.toLowerCase().includes(keyword.toLowerCase())
      );

      return matchesCarrier && matchesService;
    });
  }
}

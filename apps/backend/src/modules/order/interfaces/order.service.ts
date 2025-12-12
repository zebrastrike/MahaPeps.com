import { CreateOrderFromCartDto } from '../dto/create-order-from-cart.dto';
import { Order, OrderItem, Payment, PaymentStatus } from '../entities/order.entity';

export interface OrderCreationService {
  createFromCart(payload: CreateOrderFromCartDto): Promise<Order>;
  addItems(orderId: string, items: OrderItem[]): Promise<Order>;
  attachAddresses(orderId: string, shippingAddressId: string, billingAddressId?: string): Promise<Order>;
}

export interface CheckoutService {
  startPaymentIntent(orderId: string, paymentMethod: string): Promise<Payment>;
  updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: Record<string, any>): Promise<Payment>;
  finalizeOrder(orderId: string): Promise<Order>;
}

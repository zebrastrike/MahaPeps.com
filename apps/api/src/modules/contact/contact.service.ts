import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailTemplatesService } from '../notifications/email-templates.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly emailTemplates: EmailTemplatesService) {}

  async submitContactForm(dto: CreateContactDto) {
    try {
      // Send notification email to support team
      await this.emailTemplates.sendContactFormNotification({
        name: dto.name,
        email: dto.email,
        phone: dto.phone || 'Not provided',
        subject: dto.subject,
        message: dto.message,
      });

      // Send confirmation email to user
      await this.emailTemplates.sendContactConfirmation({
        name: dto.name,
        email: dto.email,
      });

      this.logger.log(`Contact form submitted by ${dto.email}`);

      return {
        success: true,
        message: 'Thank you for contacting us. We will get back to you soon.',
      };
    } catch (error) {
      this.logger.error(`Failed to process contact form: ${error.message}`, error.stack);
      throw error;
    }
  }
}

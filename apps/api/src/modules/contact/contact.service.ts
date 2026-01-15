import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailTemplatesService } from '../notifications/email-templates.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly emailTemplates: EmailTemplatesService,
    private readonly notifications: NotificationsService,
  ) {}

  async submitContactForm(dto: CreateContactDto) {
    try {
      // Generate notification email for support team
      const notificationEmail = this.emailTemplates.getContactFormNotificationEmail({
        name: dto.name,
        email: dto.email,
        phone: dto.phone || 'Not provided',
        subject: dto.subject,
        message: dto.message,
      });

      // Send notification email to support
      await this.notifications.sendEmail({
        to: process.env.ADMIN_EMAIL || 'support@mahapeps.com',
        subject: notificationEmail.subject,
        html: notificationEmail.html,
      });

      // Generate and send confirmation email to user
      const confirmationEmail = this.emailTemplates.getContactConfirmationEmail({
        name: dto.name,
        email: dto.email,
      });

      await this.notifications.sendEmail({
        to: dto.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
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

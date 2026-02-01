import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'
import { Configuration } from '../../../common/config'

@Injectable()
export class EmailService {
  private readonly emailConfig: Configuration['email']
  private readonly logger = new Logger(EmailService.name)
  private transporter: Transporter

  constructor(private readonly configService: ConfigService<Configuration>) {
    const emailConfig = this.configService.getOrThrow('email', {
      infer: true,
    })
    this.emailConfig = emailConfig
    this.transporter = createTransport(emailConfig.smtp)
  }

  async sendMail(options: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.emailConfig.from,
        ...options,
      })
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`)
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error)
      throw error
    }
  }
}

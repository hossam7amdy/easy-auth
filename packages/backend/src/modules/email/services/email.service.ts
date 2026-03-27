import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'
import mailerConfig from '../../../config/mailer.config'

@Injectable()
export class EmailService {
  private transporter: Transporter
  private logger = new Logger(EmailService.name)

  constructor(
    @Inject(mailerConfig.KEY)
    private config: ConfigType<typeof mailerConfig>,
  ) {
    this.transporter = createTransport(this.config.smtp)
    this.transporter.verify().catch((error) => {
      this.logger.error('Failed to connect to SMTP server', error)
    })
  }

  async sendMail(options: {
    to: string
    subject: string
    html: string
    text: string
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        ...options,
      })
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`)
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error)
      throw error
    }
  }
}

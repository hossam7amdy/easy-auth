import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { EmailService } from './email.service'

describe('EmailService', () => {
  let service: EmailService
  let configService: ConfigService

  const mockConfigService = {
    getOrThrow: jest.fn(),
  }

  const mockTransporter = {
    sendMail: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    mockConfigService.getOrThrow.mockReturnValue({
      from: 'noreply@test.com',
      smtp: {
        host: 'localhost',
        port: 1025,
        secure: false,
      },
    })

    // Mock nodemailer createTransport
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn(() => mockTransporter),
    }))

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<EmailService>(EmailService)
    configService = module.get<ConfigService>(ConfigService)

    // Manually set transporter for testing
    ;(service as any).transporter = mockTransporter
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendMail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      }

      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' })

      await service.sendMail(emailOptions)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        ...emailOptions,
      })
    })

    it('should throw error when email sending fails', async () => {
      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      }

      const error = new Error('SMTP connection failed')
      mockTransporter.sendMail.mockRejectedValue(error)

      await expect(service.sendMail(emailOptions)).rejects.toThrow(error)
    })
  })
})

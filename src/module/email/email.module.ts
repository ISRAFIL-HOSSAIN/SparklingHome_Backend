import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { EmailService } from "./email.service";

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        // transport: {
        //   service: "gmail",
        //   auth: {
        //     user: configService.get<string>("MAILER_USER_EMAIL"),
        //     pass: configService.get<string>("MAILER_USER_PASSWORD"),
        //   },
        // },
        transport: {
          host: configService.get<string>("MAILER_HOST_SERVER", ""),
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>("MAILER_USER_EMAIL", ""),
            pass: configService.get<string>("MAILER_USER_PASSWORD", ""),
          },
        },
        defaults: {
          from: `Glansandehem <${configService.get<string>(
            "MAILER_USER_EMAIL",
          )}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

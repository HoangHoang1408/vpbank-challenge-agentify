import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import * as Joi from 'joi';
import { FactRmTask } from './rm_task/entities/fact_rm_task.entity';
import { RelationshipManager } from './rm/entities/rm.entity';
import { Customer } from './customer/entities/customer.entity';
import { Card } from './card/entities/card.entity';
import { McpModule } from '@rekog/mcp-nest';
import { CustomerModule } from './customer/customer.module';
import { RmTaskModule } from './rm_task/rm_task.module';
import { RmModule } from './rm/rm.module';
import { CardModule } from './card/card.module';
import { RmTaskTool } from './tools/rm_task.tool';
import { ToolModule } from './tools/tool.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validationSchema: Joi.object({
        APP_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('postgres.host'),
        port: configService.get<number>('postgres.port'),
        username: configService.get('postgres.username'),
        password: configService.get<string>('postgres.password'),
        database: configService.get<string>('postgres.database'),
        entities: [FactRmTask, RelationshipManager, Customer, Card],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    // Feature modules
    CustomerModule,
    RmModule,
    RmTaskModule,
    CardModule,
    ToolModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

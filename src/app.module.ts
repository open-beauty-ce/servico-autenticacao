import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as MongooseAutopopulate from 'mongoose-autopopulate';
import * as MongoosePaginate from 'mongoose-paginate';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';

jest.setTimeout(30000);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`, '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        connectionFactory(connection) {
          connection.plugin(MongooseAutopopulate);
          connection.plugin(MongoosePaginate);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    AutenticacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

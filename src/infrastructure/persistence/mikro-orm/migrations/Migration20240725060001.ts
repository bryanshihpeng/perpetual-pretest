import { Migration } from '@mikro-orm/migrations';

export class Migration20240725060001 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "reserve_entity" ("currency_code" varchar(255) not null, "currency_name" varchar(255) not null, "precision" int not null, "amount" int not null, constraint "reserve_entity_pkey" primary key ("currency_code"));',
    );
  }
}

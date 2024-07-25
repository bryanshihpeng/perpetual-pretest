import { Migration } from '@mikro-orm/migrations';

export class Migration20240725060827 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "reserve_entity" alter column "amount" type numeric(10,0) using ("amount"::numeric(10,0));',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "reserve_entity" alter column "amount" type int using ("amount"::int);',
    );
  }
}

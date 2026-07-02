import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Snippets {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 30, nullable: false, unique: true })
  alias!: string

  @Column({type: 'text', nullable: true})
  description!: string

  @Column({ type: 'varchar', length: 200, nullable: false })
  content!: string

  @CreateDateColumn()
  createdAt!: Date
}

@Entity()
export class Buckets {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({type: 'varchar', length: 20, nullable: false, unique: true})
  name!: string

  @OneToMany(() => Files, (file) => file.bucket)
  files!: Files[]

  @CreateDateColumn()
  createdAt!: Date
}

@Entity()
export class Files {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({type: 'varchar', length: 50, nullable: false})
  name!: string

  @ManyToOne(() => Buckets, (bucket) => bucket.files, { onDelete: 'CASCADE' })
  bucket!: Buckets

  @CreateDateColumn()
  createdAt!: Date
}
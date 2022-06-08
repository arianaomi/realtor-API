import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HomeResponseDto {
  id: number;
  @Exclude()
  numberOfBedrooms: number;
  @Exclude()
  numberOfBathrooms: number;
  city: string;
  @Exclude()
  listedDate: Date;
  price: number;
  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }
  land_size: number;
  propertyType: PropertyType;
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;
  @Exclude()
  realtorId: number;
  image: string;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  landSize: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;
  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;
  @IsNumber()
  @IsPositive()
  price: number;
  @IsEnum(PropertyType)
  propertyType: PropertyType;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsNumber()
  @IsOptional()
  landSize?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  numberOfBathrooms?: number;
  @IsNumber()
  @IsOptional()
  @IsPositive()
  numberOfBedrooms?: number;
  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;
}

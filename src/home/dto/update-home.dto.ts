import { PartialType } from '@nestjs/mapped-types';
import { HomeResponseDto } from './home.dto';

export class UpdateHomeDto extends PartialType(HomeResponseDto) {}

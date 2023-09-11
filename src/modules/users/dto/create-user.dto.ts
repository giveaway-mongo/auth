import { UserCreateRequest } from '@protogen/user/user';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class UserCreateInput implements UserCreateRequest {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  // TODO: check if this validation is applicable
  // @IsPhoneNumber('')
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  // TODO: figure out how to get role from database
  role: string;

  @IsString()
  @IsUrl()
  avatar: string;
}

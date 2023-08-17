import { UserUpdateRequest } from '@protogen/user/user';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class UserUpdateInput implements UserUpdateRequest {
  @IsNotEmpty()
  @IsString()
  guid: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  // TODO: check if this validation is applicable
  // @IsPhoneNumber('')
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsUrl()
  avatar: string;
}

import { UserUpdateRequest } from '@protogen/user/user';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class UserUpdateInput implements UserUpdateRequest {
  // TODO: Add guid field into DTO

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

  // TODO: figure out should avatar field exist here or not
}

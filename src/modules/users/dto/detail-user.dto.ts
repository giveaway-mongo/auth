import { UserDetailRequest } from '@protogen/user/user';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDetailInput implements UserDetailRequest {
  @IsNotEmpty()
  @IsString()
  guid: string;
}

import { UserDeleteRequest } from '@protogen/user/user';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDeleteInput implements UserDeleteRequest {
  @IsNotEmpty()
  @IsString()
  guid: string;
}

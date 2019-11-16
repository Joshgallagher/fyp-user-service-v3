import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from '../entity/User';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo() {
        return User;
    }

    async beforeInsert({ entity }: InsertEvent<User>) {
        entity.password = await hash(entity.password, 10);
    }
}

import { db } from './index';
import { practices } from './schema';
import { INIT_PRACTICES } from '@ananta/utils';
import { uid } from '@ananta/utils';

export async function seedPractices(userId: string) {
  for (const practice of INIT_PRACTICES) {
    await db.insert(practices).values({
      id: uid(),
      userId,
      ...practice,
    });
  }
}

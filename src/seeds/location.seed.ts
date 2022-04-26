import { DeepPartial, getRepository } from 'typeorm';
import { Seeder } from 'typeorm-seeding';
import { Location } from '~/entities';

export default class CreateLocations implements Seeder {
  async run() {
    const defaultLocations: DeepPartial<Location>[] = [
      {
        id: '1000000000000000000',
        name: 'Hà Nội',
        lat: 21.0245,
        lng: 105.841169,
      },
      {
        id: '1000000000000000001',
        name: 'Thái Bình',
        lat: 20.45,
        lng: 106.340019,
      },
    ];
    const locations = await getRepository(Location).find();
    await getRepository(Location).save(
      defaultLocations.map((defaultLocation, i) => ({
        ...locations[i],
        ...defaultLocation,
      })),
    );
  }
}

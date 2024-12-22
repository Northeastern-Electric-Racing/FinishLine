import { NotFoundException } from '../utils/errors.utils';
import { downloadImageFile } from '../utils/google-integration.utils';

export default class OnboardingServices {
  static async downloadImage(fileId: string) {
    const fileData = await downloadImageFile(fileId);
    console.log('FILE DATA RECEIVED');

    if (!fileData) throw new NotFoundException('Image File', fileId);
    return fileData;
  }
}

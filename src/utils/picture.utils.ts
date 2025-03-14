import { SERVER_URL } from '@api/config/axios-instance.ts';

export const getPictureFullUrl = (picture: string) => {
    return picture.includes('https') ? picture : `${SERVER_URL}/public/${picture}`;
};

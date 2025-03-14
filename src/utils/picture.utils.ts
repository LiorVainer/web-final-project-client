import { SERVER_URL } from '@api/config/axios-instance.ts';

export const getPictureFullUrl = (imageSuffix: string) => {
    return `${SERVER_URL}public/${imageSuffix}`;
};

import { render, screen, waitFor } from '@testing-library/react';
import Page from '../../src/app/home/page';
import '@testing-library/jest-dom';

const mockListingsData = [
  {
    _id: '1bee1304-8040-4b99-8a6a-9659d82152ae',
    userInfo: { email: 'nani_ceballos@hotmail.com' },
    homeInfo: {
      firstImage: {
        _type: 'image',
        _key: '02a0d2f43781',
        asset: {
          _ref: 'image-f99a34659ec1c11250a82fa96c657c7727821fcc-1024x768-jpg',
          _type: 'reference',
        },
      },
    },
  },
];

beforeAll(() => {
  (global.fetch as jest.Mock) = jest.fn(
    () =>
      Promise.resolve({
        ok: true, // Simulate a successful response
        status: 200, // Simulate a HTTP status code
        json: () => Promise.resolve(mockListingsData),
      }) as Promise<Response>
  );
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Home Page', () => {
  it('should contain the text "LONDON"', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('LONDON')).toBeInTheDocument();
    });
  });
});

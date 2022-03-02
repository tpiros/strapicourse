import { fetcher } from '../../lib/api';
import {
  getTokenFromLocalCookie,
  getTokenFromServerCookie,
  getUserFromLocalCookie,
} from '../../lib/auth';
import { useFetchUser } from '../../lib/authContext';
import Layout from '../../components/Layout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import markdownToHtml from '../../lib/markdownToHtml';

const Film = ({ film, plot, reviews }) => {
  const { user, loading } = useFetchUser();
  const [review, setReview] = useState({
    value: '',
  });
  const router = useRouter();
  const handleChange = (e) => {
    setReview({ value: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwt = getTokenFromLocalCookie();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            data: {
              review: review.value,
              reviewer: getUserFromLocalCookie(),
              Film: film.id,
            },
          }),
        }
      );
      const responseData = await response.json();
      router.reload();
    } catch (error) {
      console.error('error with request', error);
    }
  };
  return (
    <Layout user={user}>
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter mb-4">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 py-2">
          {film.attributes.title}
        </span>
      </h1>
      <p>
        Directed by{' '}
        <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
          {film.attributes.director}
        </span>
      </p>
      <h2 className="text-3xl md:text-4xl font-extrabold leading-tighter mb-4 mt-4">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 py-2">
          Plot
        </span>
      </h2>
      <div
        className="tracking-wide font-normal text-sm"
        dangerouslySetInnerHTML={{ __html: plot }}
      ></div>
      {user && (
        <>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tighter mb-4 mt-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 py-2">
              Reviews
            </span>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full text-sm px-3 py-2 text-gray-700 border border-2 border-teal-400 rounded-lg focus:outline-none"
                rows="4"
                value={review.value}
                onChange={handleChange}
                placeholder="Add your review"
              ></textarea>
              <button
                className="md:p-2 rounded py-2 text-black bg-purple-200 p-2"
                type="submit"
              >
                Add Review
              </button>
            </form>
          </h2>
          <ul>
            {film.attributes.reviews.data.length === 0 && (
              <span>No reviews yet</span>
            )}
            {film.attributes.reviews &&
              film.attributes.reviews.data.map((review) => {
                return (
                  <li key={review.id}>
                    <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                      {review.attributes.reviewer}
                    </span>{' '}
                    said &quot;{review.attributes.review}&quot;
                  </li>
                );
              })}
          </ul>
        </>
      )}
    </Layout>
  );
};

export async function getServerSideProps({ req, params }) {
  const { slug } = params;
  const jwt =
    typeof window !== 'undefined'
      ? getTokenFromLocalCookie()
      : getTokenFromServerCookie(req);

  const filmResponse = await fetcher(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/films/${slug}?populate=*`,
    jwt
      ? {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      : ''
  );
  const plot = await markdownToHtml(filmResponse.data.attributes.plot);
  return {
    props: {
      film: filmResponse.data,
      plot,
    },
  };
}

export default Film;

import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../components/Layout';
import { getIdFromLocalCookie, getTokenFromServerCookie } from '../lib/auth';
import { useFetchUser } from '../lib/authContext';

const Profile = ({ avatar }) => {
  const { user, loading } = useFetchUser();
  const [image, setImage] = useState(null);
  const router = useRouter();

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const tmpImage = event.target.files[0];
      setImage(tmpImage);
    }
  };

  const uploadToServer = async () => {
    const formData = new FormData();
    const file = image;
    formData.append('inputFile', file);
    formData.append('user_id', getIdFromLocalCookie());
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.message === 'success') {
        router.reload('/profile');
      }
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  };
  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && (
        <Layout user={user}>
          <>
            <h1 className="text-5xl font-bold">
              Welcome back{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                {user}
              </span>
              <span>👋</span>
            </h1>
            {!avatar && (
              <div>
                <h4>Select Image</h4>
                <input type="file" onChange={uploadToClient} />
                <button
                  className="md:p-2 rounded py-2 text-black bg-purple-200 p-2"
                  type="submit"
                  onClick={uploadToServer}
                >
                  Set Profile Image
                </button>
              </div>
            )}
            {/* eslint-disable @next/next/no-img-element */}
            {avatar && (
              <img
                src={`https://res.cloudinary.com/tamas-demo/image/upload/f_auto,q_auto,w_150,h_150,g_face,c_thumb,r_max/${avatar}`}
                alt="Profile"
              />
            )}
          </>
        </Layout>
      )}
    </>
  );
};

export default Profile;

export async function getServerSideProps({ res, req }) {
  const jwt = getTokenFromServerCookie(req);
  if (!jwt) {
    return {
      redirect: {
        destination: '/',
      },
    };
  } else {
    const jwt = getTokenFromServerCookie(req);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    const data = await response.json();
    return {
      props: {
        avatar: data.avatar,
      },
    };
  }
}

// https://unsplash.com/photos/OhKElOkQ3RE?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink

import Layout from '../components/Layout';
import { default as RegisterComponent } from '../components/Register';
import { useFetchUser } from '../lib/authContext';
const Register = () => {
  const { user, loading } = useFetchUser();
  return (
    <Layout user={user}>
      <RegisterComponent />
    </Layout>
  );
};
export default Register;

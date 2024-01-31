import SignUpForm from '@/components/SignUpForm';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main className="w-full flex flex-col min-h-screen py-12">
      <h1 className="m-auto text-xl text-center my-4 font-sans">
        Complete the sign up process by setting your password <br /> and
        submitting payment.
      </h1>
      <SignUpForm />
    </main>
  );
};

export default Page;

import React from 'react';
import Header from '../../components/public/header';
import Footer from '../../components/public/footer';
const homePage = () => {
    return (
        <div>
            {/* header */}
            <Header />
            {/* body */}
            <div>home page body</div>
            {/* footer */}
            <Footer />
        </div>
    );
};

export default homePage;

import { Helmet } from 'react-helmet-async';

/**
 * Sahifa uchun meta teglar (title, description, og)
 * CRM settings.site_name default title qismida ishlatiladi
 */
const PageMeta = ({ title, description, siteName = 'Nuur Home Collection' }) => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const desc = description || siteName;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={desc} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={desc} />
        </Helmet>
    );
};

export default PageMeta;

import { useParams, useLocation } from 'react-router-dom';
import FormWidget from '../components/widget/FormWidget';

const WidgetPreview = () => {
    const { appId } = useParams();
    const location = useLocation();

    // Obtener el token de los query params (?token=...)
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">

            {/* Render the widget with appId and token */}
            <FormWidget appId={appId} token={token} isPreview={true} />
        </div>
    );
};

export default WidgetPreview;

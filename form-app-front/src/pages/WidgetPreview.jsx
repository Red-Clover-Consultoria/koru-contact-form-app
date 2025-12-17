import { useParams } from 'react-router-dom';
import FormWidget from '../components/widget/FormWidget';

const WidgetPreview = () => {
    const { appId } = useParams();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold mb-8 text-gray-900">Previsualización del widget: {appId}</h1>
            <p className="mb-8 text-gray-700">Esto simula el widget en un sitio cliente.</p>

            {/* Render the widget */}
            <FormWidget appId={appId} isPreview={true} />
        </div>
    );
};

export default WidgetPreview;

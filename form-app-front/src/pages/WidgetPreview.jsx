import { useParams } from 'react-router-dom';
import FormWidget from '../components/widget/FormWidget';

const WidgetPreview = () => {
    const { appId } = useParams();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold mb-8 text-gray-500">Widget Preview: {appId}</h1>
            <p className="mb-8 text-gray-400">This simulates the widget on a client site.</p>

            {/* Render the widget */}
            <FormWidget appId={appId} isPreview={true} />
        </div>
    );
};

export default WidgetPreview;

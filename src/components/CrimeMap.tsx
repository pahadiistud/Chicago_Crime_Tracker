import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CrimeData } from '../types';
import { format } from 'date-fns';

// Fix for default marker icons in Leaflet with bundlers
// using divIcon for custom colored markers instead
const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6]
});

function getCrimeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('homicide')) return '#e11d48'; // rose-600
  if (t.includes('robbery') || t.includes('assault')) return '#f97316'; // orange-500
  if (t.includes('theft') || t.includes('burglary')) return '#eab308'; // yellow-500
  if (t.includes('narcotics')) return '#8b5cf6'; // violet-500
  if (t.includes('criminal damage')) return '#64748b'; // slate-500
  return '#3b82f6'; // blue-500
}

interface CrimeMapProps {
  crimes: CrimeData[];
}

export default function CrimeMap({ crimes }: CrimeMapProps) {
  // Chicago Default Center
  const center: [number, number] = [41.8781, -87.6298];

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-xl border border-gray-200 z-10">
      <MapContainer 
        center={center} 
        zoom={11} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {crimes.map((crime) => {
          const lat = parseFloat(crime.latitude);
          const lng = parseFloat(crime.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={crime.id} 
              position={[lat, lng]}
              icon={createCustomIcon(getCrimeColor(crime.primary_type))}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-sm text-gray-900 border-b pb-1 mb-2">
                    {crime.primary_type}
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p><span className="font-semibold text-gray-800">Case #:</span> {crime.case_number}</p>
                    <p><span className="font-semibold text-gray-800">Date:</span> {format(new Date(crime.date), 'MMM d, yyyy h:mm a')}</p>
                    <p><span className="font-semibold text-gray-800">Location:</span> {crime.block}</p>
                    <p><span className="font-semibold text-gray-800">Description:</span> {crime.description}</p>
                    <div className="flex gap-2 pt-1 border-t mt-1">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${crime.arrest ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {crime.arrest ? 'Arrest' : 'No Arrest'}
                      </span>
                      {crime.domestic && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-100 text-purple-700">
                          Domestic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

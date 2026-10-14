import React from 'react';
import { GarmentArticle, GarmentColor, FaceDesign } from '../../types';
import { LovableScene3D } from './LovableScene3D';

interface GarmentViewer3DProps {
  article: GarmentArticle;
  color: GarmentColor;
  frontDesign: FaceDesign;
  backDesign: FaceDesign;
  currentFace: 'front' | 'back';
  onFaceChange?: (face: 'front' | 'back') => void;
  className?: string;
  onCaptureRef?: (captureFn: () => string) => void;
  isWindActive?: boolean;
  onToggleWind?: () => void;
  isAutoRotate?: boolean;
  onToggleAutoRotate?: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onDeselectElement?: () => void;
}

export const GarmentViewer3D: React.FC<GarmentViewer3DProps> = ({
  className = '',
  onCaptureRef,
  isWindActive = false,
  onToggleWind = () => {},
  isAutoRotate = false,
  onToggleAutoRotate = () => {},
  isZenMode = false,
  onToggleZenMode,
  onDeselectElement
}) => {
  return (
    <LovableScene3D
      className={className}
      onCaptureRef={onCaptureRef}
      isWindActive={isWindActive}
      onToggleWind={onToggleWind}
      isAutoRotate={isAutoRotate}
      onToggleAutoRotate={onToggleAutoRotate}
      isZenMode={isZenMode}
      onToggleZenMode={onToggleZenMode}
      onDeselectElement={onDeselectElement}
    />
  );
};

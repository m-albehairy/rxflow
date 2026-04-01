import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';

interface Product {
  id: string;
  barcode?: string;
  nameEn: string;
  nameAr: string;
  defaultSellingPrice: string | number;
  trackExpiry?: boolean;
}

interface BarcodeLabelPrintProps {
  products: Product[];
  quantities: Record<string, number>;
  labelSize: 'small' | 'medium' | 'large';
  barcodeFormat: 'CODE128' | 'EAN13';
}

const LABEL_DIMENSIONS = {
  small: { width: 113, height: 75 },
  medium: { width: 189, height: 113 },
  large: { width: 264, height: 151 },
};

const BARCODE_OPTIONS = {
  small: { width: 1, height: 20, fontSize: 8, margin: 0 },
  medium: { width: 1.2, height: 30, fontSize: 10, margin: 2 },
  large: { width: 1.5, height: 40, fontSize: 12, margin: 4 },
};

const NAME_FONT_SIZE = {
  small: 7,
  medium: 9,
  large: 11,
};

const PRICE_FONT_SIZE = {
  small: 8,
  medium: 10,
  large: 13,
};

export function BarcodeLabelPrint({
  products,
  quantities,
  labelSize,
  barcodeFormat,
}: BarcodeLabelPrintProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('products');
  const { getSetting } = useSettings();
  const currency = getSetting<string>('currency') || 'SAR';

  useEffect(() => {
    if (!containerRef.current) return;
    const svgs = containerRef.current.querySelectorAll<SVGSVGElement>('svg[data-barcode]');
    svgs.forEach((svg) => {
      const value = svg.getAttribute('data-barcode');
      if (!value) return;
      try {
        const opts = BARCODE_OPTIONS[labelSize];
        JsBarcode(svg, value, {
          format: barcodeFormat,
          width: opts.width,
          height: opts.height,
          fontSize: opts.fontSize,
          margin: opts.margin,
          displayValue: true,
          textMargin: 1,
        });
      } catch {
        // Invalid barcode value for the selected format
        svg.innerHTML = '';
      }
    });
  }, [products, quantities, labelSize, barcodeFormat]);

  const dim = LABEL_DIMENSIONS[labelSize];
  const nameFontSize = NAME_FONT_SIZE[labelSize];
  const priceFontSize = PRICE_FONT_SIZE[labelSize];

  const labels: React.ReactNode[] = [];

  products.forEach((product) => {
    const qty = quantities[product.id] || 1;
    for (let i = 0; i < qty; i++) {
      const key = `${product.id}-${i}`;
      const price = typeof product.defaultSellingPrice === 'string'
        ? parseFloat(product.defaultSellingPrice).toFixed(2)
        : product.defaultSellingPrice.toFixed(2);

      labels.push(
        <div
          key={key}
          className="barcode-label"
          style={{
            width: dim.width,
            height: dim.height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            boxSizing: 'border-box',
            border: '0.5px dashed #ccc',
            overflow: 'hidden',
          }}
        >
          {/* Product names */}
          <div
            style={{
              fontSize: nameFontSize,
              lineHeight: 1.2,
              textAlign: 'center',
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontWeight: 600,
            }}
            dir="rtl"
          >
            {product.nameAr}
          </div>
          <div
            style={{
              fontSize: nameFontSize - 1,
              lineHeight: 1.2,
              textAlign: 'center',
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              color: '#555',
            }}
          >
            {product.nameEn}
          </div>

          {/* Barcode */}
          {product.barcode ? (
            <svg data-barcode={product.barcode} style={{ maxWidth: '95%' }} />
          ) : (
            <div
              style={{
                fontSize: nameFontSize,
                color: '#999',
                padding: '4px 0',
              }}
            >
              {t('noBarcode', 'No barcode')}
            </div>
          )}

          {/* Price */}
          <div
            style={{
              fontSize: priceFontSize,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {price} {currency}
          </div>

          {/* Expiry note */}
          {product.trackExpiry && (
            <div
              style={{
                fontSize: Math.max(nameFontSize - 2, 5),
                color: '#888',
                lineHeight: 1,
              }}
            >
              {t('trackExpiry')}
            </div>
          )}
        </div>,
      );
    }
  });

  return (
    <div
      ref={containerRef}
      className="barcode-print-container"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        padding: 4,
      }}
    >
      {labels}
    </div>
  );
}

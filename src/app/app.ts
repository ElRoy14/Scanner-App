import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnDestroy {

  @ViewChild('video', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  scannedCode: string | null = null;

  private hints = new Map().set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A,
  ]);

  private codeReader = new BrowserMultiFormatReader(this.hints);
  private controls!: IScannerControls;

  async startScanner() {
    this.scannedCode = null;

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (devices.length === 0) {
        alert('No se encontró cámara');
        return;
      }

      // 🔥 Buscar cámara trasera por nombre
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );

      // Si no la encuentra, usar la última (en móviles suele ser la trasera)
      const selectedDeviceId = backCamera
        ? backCamera.deviceId
        : devices[devices.length - 1].deviceId;

      this.controls = await this.codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        this.videoElement.nativeElement,
        (result, error) => {
          if (result) {
            this.scannedCode = result.getText();
            alert('Código detectado: ' + this.scannedCode);
            this.stopScanner();
          }
        }
      );

    } catch (err) {
      console.error(err);
      alert('Error al iniciar cámara');
    }
  }

  stopScanner() {
    if (this.controls) {
      this.controls.stop();
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
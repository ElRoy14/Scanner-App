import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Product } from './models/product';
import { ProductsService } from './service/product.service';
import { productDto, productResponse } from './models/productResponse';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {

  @ViewChild('video', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  scannedCode: string | null = null;

  errorMessage: unknown | null = null;

  private hints = new Map().set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.UPC_A,
  ]);

  private codeReader = new BrowserMultiFormatReader(this.hints);
  private controls!: IScannerControls;
  private fb = inject(FormBuilder);
  private productService = inject(ProductsService);

  formulario!: FormGroup;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarProductos();
  }

    private inicializarFormulario(): void {
    this.formulario = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      barCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(18)]],
      presentation: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    });
  }

  productos = signal<productDto[]>([]);

    cargarProductos(): void {
    this.productService.getAllProducts().subscribe({
      next: (data: productResponse) => {
        console.log('Productos cargados:', data.items);
        this.productos.set(data.items);
        //this.productos.set(data);
      },
      error: (error) => {
        this.errorMessage = error || 'Error desconocido';
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
      },
    });
  }

  crearProducto(): void {
    if (this.formulario.invalid) {
      return;
    }

    const product: Product = {
      Name: this.formulario.value.name,
      BarCode: this.formulario.value.barCode,
      Presentation: this.formulario.value.presentation,
    };

    console.log(product.Name);

    this.productService.createProduct(product).subscribe({
      next: (response) => {
        console.log('Producto creado:', response);
        alert('Producto creado exitosamente');
        this.formulario.reset();
        this.cargarProductos();
      },
      error: (error) => {
        this.errorMessage = error || 'Error desconocido';
        alert('Error al crear producto');
        console.error('Error al crear producto:', error);
      },
    });
  }

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

      console.log('Cámaras disponibles:', devices);

      // Si no la encuentra, usar la última (en móviles suele ser la trasera)
      const selectedDeviceId = backCamera
        ? backCamera.deviceId
        : devices[devices.length - 1].deviceId;


      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { ideal: 'environment' } // cámara trasera
        }
      };

      this.controls = await this.codeReader.decodeFromConstraints(
        constraints,
        this.videoElement.nativeElement,
        (result, error) => {
          if (result) {
            this.scannedCode = result.getText();
            this.formulario.patchValue({ barCode: this.scannedCode });
            this.stopScanner();
          }
        }
      );

    } catch (error) {
      console.error(error);
      this.errorMessage = error || 'Error desconocido';
      alert('Error al iniciar cámara');
    }
  }

    toggleFormulario(): void {
        this.formulario.reset();
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

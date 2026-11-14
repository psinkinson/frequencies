import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

type BtnSelection = '' | 'CROWN' | 'THIRD_EYE' | 'THROAT' | 'HEART' | 'SOLAR_PLEXUS' | 'SACRAL' | 'ROOT' | 'DELTA' | 'THETA' | 'ALPHA' | 'BETA'

type Btn = {
  name: string,
  typ: BtnSelection,
  hzL: number,
  hzR: number
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <button class="btn btn--stop" (click)="stop()" [disabled]="!running()">
        Stop
      </button>
      <div class="button-group">
        @for (btn of btnsChakra; track $index) {
            <button (click)="onClickBtn(btn)" class="btn btn--{{btn.typ}}" [class.btn--selected]="btn.typ === selectedButton()">
            {{btn.name}}
            @if (btn.hzL === btn.hzR) {
              <span>{{btn.hzL}}Hz</span>
            } @else {
              <span>{{btn.hzR - btn.hzL}}Hz</span>
            }
          </button>
        }
      </div>

      <hr>

      <button (click)="start()">Start</button>
      <button (click)="stop()">Stop</button>

      <input id="leftStereo" type="number" [value]="leftSignal()" (change)="updateLeftSignal($event)" />
      <input id="rightStereo" type="number" [value]="rightSignal()" (change)="updateRightSignal($event)" />
      <input id="dif" type="number" [value]="diff()" (change)="updateDiff($event)" />
    </div>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  title = 'audio';

  private channel1: any;
  private channel2: any;
  private osc1: any;
  private osc2: any;
  private initialised = false;
  public running = signal(false);
  public btnsChakra: Btn[] = [
    { name: 'Crown Chakra ', typ: 'CROWN', hzL: 963, hzR: 963 },
    { name: 'Third Eye Chakra', typ: 'THIRD_EYE', hzL: 852, hzR: 852 },
    { name: 'Throat Chakra', typ: 'THROAT', hzL: 741, hzR: 741 },
    { name: 'Heart Chakra', typ: 'HEART', hzL: 639, hzR: 639 },
    { name: 'Solar Plexus Chakra', typ: 'SOLAR_PLEXUS', hzL: 528, hzR: 528 },
    { name: 'Sacral Chakra', typ: 'SACRAL', hzL: 417, hzR:417  },
    { name: 'Root Chakra', typ: 'ROOT', hzL: 396, hzR: 396 },
    { name: 'Delta', typ: 'DELTA', hzL: 300, hzR: 303 },
    { name: 'Theta', typ: 'THETA', hzL: 300, hzR: 306 },
    { name: 'Alpha', typ: 'ALPHA', hzL: 300, hzR: 311 },
    { name: 'Beta', typ: 'BETA', hzL: 300, hzR: 325 },
  ];

  public selectedButton = signal<BtnSelection>('')
  public leftSignal = signal(300);
  public rightSignal = signal(303.875);
  public diff = signal(5);

  constructor() {
    // effect(() => {
    //   if(this.running()) {
    //     const val = this.leftStereo();
    //     this.osc1.frequency.value = val;
    //   }
    // });

    // effect(() => {
    //   if(this.running()) {
    //     const val = this.rightStereo();
    //     console.log('effect right stereo', val);
    //     this.osc2.frequency.value = val;
    //   }
    // });

    // effect(() => {
    //   if(this.running()) {
    //     const left = this.leftStereo();
    //     const diff = this.diff();
    //     this.leftStereo.set(left + diff);
    //   }
    // });
  }

  private  setup() {

    if(this.initialised) {
      return;
    }
    //Channel 1
    this.channel1 = new (window.AudioContext) ();

    //Channel 2
    this.channel2 = new (window.AudioContext) ();

    //Tone 1
    this.osc1 = this.channel1.createOscillator() //default frequency is 440HZ
    this.osc1.frequency.value = this.rightSignal();
    //Tone 2
    this.osc2 = this.channel2.createOscillator()
    this.osc2.frequency.value = this.rightSignal();

    //Channel 1 Left Stereo
    const leftStereo = new StereoPannerNode(this.channel1)
    leftStereo.pan.value = -1 // -1 left side, 0 balanced, 1 right side

    //Channel 2 right Stereo
    const rightStereo = new StereoPannerNode(this.channel2, { pan: 1}) //shortcut: set pan in creation options

    //Plug the 1st tone into left stereo, and then out channel 1
    this.osc1.connect(leftStereo).connect(this.channel1.destination)

    //Plug the 2nd tone into right stereo, and then out channel 2
    this.osc2.connect(rightStereo).connect(this.channel2.destination)

    //Plug in speakers
    // osc1.connect(this.channel1.destination)
    // osc2.connect(this.channel2.destination)

    this.initialised = true;

    //Play
    this.osc1.start()
    this.osc2.start()
    this.running.set(true);

  } 

  private cleanup() {
    if(this.initialised) {
      this.osc1.stop()
      this.osc2.stop()
      this.channel1.close()
      this.channel2.close()
      this.initialised = false
      this.running.set(false)
    }
  }

  stop() {
    if(this.running()) {
      this.channel1.suspend()
      this.channel2.suspend()
      this.running.set(false)
      this.selectedButton.set('')
    }
  }

  start() {
    if(this.initialised) {
      this.channel1.resume()
      this.channel2.resume()
      this.running.set(true)
    } else {
      this.setup();
    }
  }

  public updateLeftSignal(event: any) {
    console.log(event, event.target.value, parseInt(event.target.value));
    this.leftSignal.set(parseInt(event.target.value));
  }

  public updateRightSignal(event: any) {
    const val = parseInt(event.target.value);
    this.rightSignal.set(val);
    if(this.running()) {
      this.osc2.frequency.value = val;
    }
  }
  public updateDiff(event: any) {
    const val = parseInt(event.target.value);
    this.diff.set(val);
    const left = this.leftSignal();
    this.rightSignal.set(left + val);
    this.updateTone();
  }

  public onClickBtn(btn:Btn) {
    if(this.running() && btn.typ === this.selectedButton()) {
      this.stop();
      return;
    }
    this.setTone(btn.hzL, btn.hzR)
    this.selectedButton.set(btn.typ)
  }

  private setTone(hzL: number, hzR: number) {
    this.setup();
    this.osc1.frequency.value = hzL;
    this.osc2.frequency.value = hzR;
    this.start();
  }

  private setDiff() {
    const left = this.leftSignal();
    const right = this.rightSignal();
    this.diff.set(right - left);
    this.updateTone();
  }
  private updateTone() {
    if(this.running()) {
    this.osc2.frequency.value = this.rightSignal();
    }
  }
}

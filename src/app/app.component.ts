import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <h1>Welcome to {{title}}!</h1>
      <div class="button-group">
        <button (click)="crownChakra()" class="btn">Crown Chakra</button>
        <button (click)="thirdEyeChakra()" class="btn">Third Eye Chakra</button>
        <button (click)="throatChakra()" class="btn">Throat Chakra</button>
        <button (click)="heartChakra()" class="btn">Heart Chakra</button>
        <button (click)="solarPlexusChakra()" class="btn">Solar Plexus Chakra</button>
        <button (click)="sacralChakra()" class="btn">Sacral Chakra</button>
        <button (click)="rootChakra()" class="btn">Root Chakra</button>
      </div>

      <hr>

      <button (click)="start()">Start</button>
      <button (click)="stop()">Stop</button>

      <input id="leftStereo" type="number" [value]="leftStereo()" (change)="updateLeftStereo($event)" />
      <input id="rightStereo" type="number" [value]="rightStereo()" (change)="updateRightStereo($event)" />
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
  private running = false;

  public leftStereo = signal(300);
  public rightStereo = signal(303.875);
  public diff = signal(5);

  constructor() {
    // effect(() => {
    //   if(this.running) {
    //     const val = this.leftStereo();
    //     this.osc1.frequency.value = val;
    //   }
    // });

    // effect(() => {
    //   if(this.running) {
    //     const val = this.rightStereo();
    //     console.log('effect right stereo', val);
    //     this.osc2.frequency.value = val;
    //   }
    // });

    // effect(() => {
    //   if(this.running) {
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
    this.osc1.frequency.value = this.rightStereo();
    //Tone 2
    this.osc2 = this.channel2.createOscillator()
    this.osc2.frequency.value = this.rightStereo();

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


    
    //Play
    this.osc1.start()
    this.osc2.start()

    this.initialised = true;
    this.running = true;

  } 

  private cleanup() {
    if(this.initialised) {
      this.osc1.stop()
      this.osc2.stop()
      this.channel1.close()
      this.channel2.close()
      this.initialised = false
      this.running = false
    }
  }

  stop() {
    if(this.running) {
      this.channel1.suspend()
      this.channel2.suspend()
      this.running = false
    }
  }

  start() {
    if(this.initialised) {
      this.channel1.resume()
      this.channel2.resume()
      this.running = true
    } else {
      this.setup();
    }
  }

  public updateLeftStereo(event: any) {
    console.log(event, event.target.value, parseInt(event.target.value));
    this.leftStereo.set(parseInt(event.target.value));
  }

  public updateRightStereo(event: any) {
    const val = parseInt(event.target.value);
    this.rightStereo.set(val);
    if(this.running) {
      this.osc2.frequency.value = val;
    }
  }
  public updateDiff(event: any) {
    const val = parseInt(event.target.value);
    this.diff.set(val);
    const left = this.leftStereo();
    this.rightStereo.set(left + val);
    this.updateTone();
  }

  public crownChakra() {
    this.setTone(963);
  }
  public thirdEyeChakra() {
    this.setTone(852);
  }
  public throatChakra() {
    this.setTone(741);
  }
  public heartChakra() {
    this.setTone(639);
  }
  public solarPlexusChakra() {
    this.setTone(528);
  }
  public sacralChakra() {
    this.setTone(417);
  }
  public rootChakra() {
    this.setTone(396);
  }

  private setTone(freq: number) {
    this.setup();
    this.osc1.frequency.value = freq;
    this.osc2.frequency.value = freq;
    this.start();
  }

  private setDiff() {
    const left = this.leftStereo();
    const right = this.rightStereo();
    this.diff.set(right - left);
    this.updateTone();
  }
  private updateTone() {
    if(this.running) {
    this.osc2.frequency.value = this.rightStereo();
    }
  }
}

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {TransportService} from '../../core/services/transport.service';
import {TransportItem} from '../transport-box/transport-box.component';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-transport-order-form',
  templateUrl: './transport-order-form.component.html',
  styleUrls: ['./transport-order-form.component.scss'],
  animations: [
    trigger('field', [
      transition(':enter', [
        style({opacity: 0}),
        animate(800)
      ])
    ]),
    trigger('stepOne', [
      state('one', style({ position: 'relative', display: 'flex', transform: 'translateX(0)' })),
      state('two', style({transform: 'translateX(-100%)', position: 'absolute'})),
      state('three', style({transform: 'translateX(-100%)', position: 'absolute'})),
      transition('one <=> *', animate(200)),
    ]),
    trigger('stepTwo', [
      state('one', style({ position: 'absolute',  transform: 'translateX(150%)', opacity: 0})),
      state('two', style({transform: 'translateX(0)', position: 'relative', opacity: 1})),
      state('three', style({transform: 'translateX(-100%)', position: 'absolute', opacity: 0})),
      transition('two <=> *', animate(200)),
    ]),
    trigger('stepThree', [
      state('one', style({ position: 'absolute',  transform: 'translateX(150%)', opacity: 0})),
      state('two', style({ position: 'absolute',  transform: 'translateX(150%)', opacity: 0})),
      state('three', style({transform: 'translateX(0)', position: 'relative', opacity: 1})),
      transition('three <=> *', animate(200)),
    ]),
  ]
})
export class TransportOrderFormComponent implements OnInit, OnChanges {
  @Input('id') transportId: string;
  entity: boolean;
  form: FormGroup;
  transportParams;
  fieldState = '';

  FormSteps = {
    one: 'one',
    two: 'two',
    three: 'three'
  }

  currentStep = this.FormSteps.one;

  constructor(private af: AngularFirestore, private transportService: TransportService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      params: new FormGroup({}),
      date: new FormControl(''),
      location: new FormControl(''),
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      tel: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.currentStep = this.FormSteps.one;

    if (changes.transportId.currentValue) {
      this.transportService.getById(changes.transportId.currentValue)
        .subscribe((data: TransportItem) => {

            if (data.params) {
              this.transportParams = data.params;

              data.params.forEach((param) => {
                (this.form.get('params') as FormGroup).addControl(param.id, new FormControl(''));
              });

              console.log('newww', this.form);
            }

        });
    }

    if (!changes.transportId.firstChange) {
      this.form.reset();
    }

  }

  selectUserType(id) {
    this.entity = id === 'entity';

    if (id === 'entity') {
      this.form.controls.companyname = new FormControl('', [Validators.required]);
      this.form.controls.companyperson = new FormControl('', [Validators.required]);
      delete this.form.controls.username;

    } else {
      this.form.controls.username = new FormControl('', [Validators.required]);
      delete this.form.controls.companyname;
      delete this.form.controls.companyperson;
    }
  }

  onSubmit() {
    if (!this.form.valid) { return; }

    const formData = { date: new Date(), ...this.form.value};


    // this.af.collection('messages').add(formData);
    this.form.reset();

    // this.form.reset();

    console.log(formData);
  }

  goToStep(step: string) {
    this.currentStep = step;
  }
}

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

const animationDuration = 200;

@Component({
  selector: 'app-service-order-form',
  templateUrl: './service-order-form.component.html',
  styleUrls: ['./service-order-form.component.scss'],
  animations: [
    trigger('field', [
      transition(':enter', [
        style({opacity: 0}),
        animate(800)
      ])
    ]),
    trigger('stepOne', [
      state('one', style({ position: 'relative',  transform: 'translateX(0)', opacity: 1 })),
      state('two', style({position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, transform: 'translateX(-100%)', opacity: 0})),
      transition('one => two', animate(animationDuration, keyframes([
        style({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, offset: 0 }),
        style({ transform: 'translateX(-100%)', offset: 1})
      ]))),
      transition('two => one', animate(animationDuration, keyframes([
        style({ opacity: 1, offset: 0 }),
        style({ transform: 'translateX(0)', offset: 1})
      ])))
    ]),
    trigger('stepTwo', [
      state('one', style({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, transform: 'translateX(100%)', opacity: 0 })),
      state('two', style({position: 'relative', transform: 'translateX(0)', opacity: 1 })),
      transition('one => two', animate(animationDuration, keyframes([
        style({ position: 'relative', opacity: 1, offset: 0 }),
        style({ transform: 'translateX(0)', offset: 1})
      ]))),
      transition('two => one', animate(animationDuration, keyframes([
        style({ transform: 'translateX(100%)', offset: 1})
      ]))),
    ])
  ]
})
export class ServiceOrderFormComponent implements OnInit {
  @Input() data;

  entity: boolean;
  form: FormGroup;
  stepTwo = false;
  serviceList = [];

  FormSteps = {
    one: 'one',
    two: 'two',
    three: 'three'
  }

  SubmitState = {
    SENDING: 'sending',
    SUCCESS: 'success',
    FAIL: 'fail'
  }

  formSubmitState;

  currentStep = this.FormSteps.one;
  fieldState = '';

  constructor(private af: AngularFirestore) { }

  ngOnInit(): void {
    this.serviceList = (this.data.list && this.data.list.length) ? [...this.data.list, {value: '0', name: 'Другой вариант'}] : null;

    this.form = new FormGroup({
      variant: new FormControl('', []),
      message: new FormControl('', []),
      personal: new FormGroup({
        userName: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        tel: new FormControl('', [Validators.required]),
      })
    });

    if (this.data.id.indexOf('rental') === -1) {
      const workGroup = new FormGroup({
        time: new FormControl('', []),
        place: new FormControl('', []),
      });

      this.form.addControl('work', workGroup);
    }
  }

  selectUserType(id) {
    this.entity = id === 'entity';

    if (id === 'entity') {
      (this.form.get('personal') as FormGroup).removeControl('userName');
      (this.form.get('personal') as FormGroup).addControl('companyName', new FormControl('', [Validators.required]));
      (this.form.get('personal') as FormGroup).addControl('companyPerson', new FormControl('', [Validators.required]));
    } else {
      (this.form.get('personal') as FormGroup).addControl('userName', new FormControl('', [Validators.required]));
      (this.form.get('personal') as FormGroup).removeControl('companyName');
      (this.form.get('personal') as FormGroup).removeControl('companyPerson');
    }
  }

  setTitleLabel(id: any) {
    if (id.indexOf('cargo') !== -1) {
      return 'Выберите груз';
    } else if (id.indexOf('work') !== -1) {
      return 'Выберите работу';
    } else if (id.indexOf('rental') !== -1) {
      return 'Выберите обьект аренды';
    }
  }

  setDateLabel(id: any) {
    if (id.indexOf('cargo') !== -1) {
      return 'Когда нужно доставить?';
    } else if (id.indexOf('work') !== -1) {
      return 'Когда нужно выполнить?';
    }
  }

  setLocationLabel(id: any) {
    if (id.indexOf('cargo') !== -1) {
      return 'Адрес доставки';
    } else if (id.indexOf('work') !== -1) {
      return 'По каком адресу?';
    }
  }

  goToStep(step: string) {
    this.currentStep = step;
  }

  onSubmit() {
    if (!this.form.valid) { return; }

    const variant = this.serviceList.filter((item) => {
      return this.form.value.variant === item.value;
    })[0];

    const formData = {...this.form.value, id: this.data.id, serviceTitle: this.data.name, variant: variant.name, date: new Date()};
    console.log(formData);

    this.formSubmitState = this.SubmitState.SENDING;

    this.af.collection('services-email').add(formData)
      .then((result) => {
        if (result) {
          this.formSubmitState = this.SubmitState.SUCCESS;
          this.form.reset();
        }
      })
      .catch((error) => {
        this.formSubmitState = this.SubmitState.FAIL;
      });
  }
}

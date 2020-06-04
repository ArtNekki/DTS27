import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface TransportItem {
  id?: string;
  name: string;
  price: string;
  promo?: boolean;
  params?: any;
  models?: any;
}

@Component({
  selector: 'app-transport-box',
  templateUrl: './transport-box.component.html',
  styleUrls: ['./transport-box.component.scss']
})

export class TransportBoxComponent implements OnInit {
  @Input() data;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLoadImage: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
  }

  goTo(data) {
    this.onChange.emit(data);
  }

  loadImage(id: string) {
    this.onLoadImage.emit(id);
  }

  formatTitle(name: any) {
    const nameArray = name && name.split(' ');

    return nameArray && nameArray.length === 2 ? `<span>${nameArray[0]}</span> ${nameArray[1]}` : name;
  }
}

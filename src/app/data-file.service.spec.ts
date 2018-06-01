import { TestBed, inject } from '@angular/core/testing';

import { DataFileService } from './data-file.service';

describe('DataFileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFileService]
    });
  });

  it('should be created', inject([DataFileService], (service: DataFileService) => {
    expect(service).toBeTruthy();
  }));
});

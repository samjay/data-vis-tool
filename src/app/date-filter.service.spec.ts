import { TestBed, inject } from '@angular/core/testing';

import { DateFilterService } from './date-filter.service';

describe('DateFilterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateFilterService]
    });
  });

  it('should be created', inject([DateFilterService], (service: DateFilterService) => {
    expect(service).toBeTruthy();
  }));
});

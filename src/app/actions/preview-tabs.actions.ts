import { AnyAction } from 'redux';
import { Injectable } from '@angular/core';
import { Actions } from '../enums/actions.enum';
import { AppState, PreviewTabCore } from '../classes/app-state.interface';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { notNullOrUndefined } from '../app.utils';

const affects: Array<keyof AppState> = ['workspaces'];

@Injectable()
export class PreviewTabsActions {

  constructor(private store: NgRedux<AppState>) {

  }

  private process(action) {
    let state = this.store.getState();
    if (notNullOrUndefined(state.activeProjectCode)) {
      action.projectCode = state.activeProjectCode;
    }
    return action;
  }

  nav(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: Actions.NAVIGATE_ON_ACTIVE,
      affects,
      tab
    });
  }

  open(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: Actions.OPEN_TAB,
      affects,
      tab
    });
  }

  openMany(tabs: PreviewTabCore[]): AnyAction {
    return this.process({
      type: Actions.OPEN_TABS,
      payload: tabs,
      affects
    });
  }

  openInBackground(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: Actions.OPEN_TAB_BACKGROUND,
      affects,
      tab
    });
  }

  openManyInBackground(tabs: PreviewTabCore[]): AnyAction {
    return this.process({
      type: Actions.OPEN_TABS_BACKGROUND,
      payload: tabs,
      affects
    });
  }

  close(id: string): AnyAction {
    return this.process({
      type: Actions.CLOSE_TAB,
      affects,
      id
    });
  }

  select(id: string): AnyAction {
    return this.process({
      type: Actions.SELECT_TAB,
      affects,
      id
    });
  }

  checkIn(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: Actions.GUEST_CHECK_IN,
      tab
    });
  }

  back(id: string) {
    return this.process({
      type: Actions.TAB_NAVIGATE_BACK,
      id
    });
  }

  forward(id: string) {
    return this.process({
      type: Actions.TAB_NAVIGATE_FORWARD,
      id
    });
  }

}

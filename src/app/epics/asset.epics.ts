import { Injectable } from '@angular/core';
import { delay, ignoreElements, map, switchMap } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { WorkflowService } from '../services/workflow.service';
import { AssetActions } from '../actions/asset.actions';
import { RootEpic } from './root.epic';
import { ContentService } from '../services/content.service';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import 'rxjs/add/observable/forkJoin';
import { Asset } from '../models/asset.model';
import { isArray } from 'util';

@Injectable()
export class AssetEpics {

  constructor(private workflow: WorkflowService,
              private content: ContentService,
              private actions: AssetActions) {

  }

  private recallForEdit = RootEpic.createEpic(
    StoreActionsEnum.FETCH_ASSET_FOR_EDIT,
    ({ payload }) => {
      let { projectCode, assetId, sessionUUID } = payload;
      return Observable
        .forkJoin([
          this.content.byId(projectCode, assetId),
          this.content.read(projectCode, assetId, true)
        ])
        .pipe(
          switchMap(responses => {
            let asset = <Asset>responses[0];
            let { content } = <any>responses[1];
            return [
              this.actions.gotten(asset),
              this.actions.fetchedForEdit(sessionUUID, content)
            ];
          })
        );
    });

  private closeEditSession = RootEpic.createEpic(
    StoreActionsEnum.CLOSE_EDIT_SESSION,
    ({ payload }) => {
      if (payload.content) {
        return this.content
          .write(payload.asset, payload.content, true)
          .pipe(map(_ => this.actions.editSessionClosed(payload.session)));
      } else {
        return this.content
          .unlock(payload.asset)
          .pipe(delay(500), map(_ => this.actions.editSessionClosed(payload.session)));
      }
    });

  private some = RootEpic.createEpic(
    StoreActionsEnum.FETCH_SOME_ASSETS,
    ({ payload }) => {
      if (isArray(payload)) {
        return Observable
          .forkJoin(payload.map(obj => this.content.byId(obj.projectCode, obj.assetId)))
          .pipe(map((results: Asset[]) => this.actions.fetchedSome(<Asset[]>results)));
      }
    });

  private persistSessionChanges = RootEpic.createEpic(
    StoreActionsEnum.PERSIST_SESSION_CHANGES,
    ({ payload }) => {
      return this.content
        .write(payload.asset, payload.content)
        .pipe(
          switchMap((asset) => [
            this.actions.gotten(asset),
            this.actions.sessionChangesPersisted({ ...payload.session, fetchPayload: payload.content })
          ])
        );
    });

  private manifest = [
    'some',
    'recallForEdit',
    'closeEditSession',
    'persistSessionChanges'
  ];

  epics() {
    return this.manifest.map(epic => {
      return ((name) =>
        (action$, store, dependencies) => this[name](action$, store, dependencies)
      )(epic);
    });
    // return [
    //   (action$, store, dependencies) => this.recallForEdit(action$, store, dependencies),
    //   (action$, store, dependencies) => this.closeEditSession(action$, store, dependencies),
    //   (action$, store, dependencies) => this.some(action$, store, dependencies)
    // ];
  }

}
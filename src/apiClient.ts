import { requestAPI } from './handler';

type APIMeta = {
  artifact_is_available: boolean
}

export const getMetaInfoAPI = (): Promise<APIMeta> => {
  return requestAPI<APIMeta>(`/api/meta`)
  .then<APIMeta>((res) => res)
}

interface TrialResponse {
  trial_id: number
  study_id: number
  number: number
  state: TrialState
  values?: TrialValueNumber[]
  intermediate_values: TrialIntermediateValue[]
  datetime_start?: string
  datetime_complete?: string
  params: TrialParam[]
  fixed_params: {
    name: string
    param_external_value: string
  }[]
  user_attrs: Attribute[]
  system_attrs: Attribute[]
  note: Note
  artifacts: Artifact[]
  constraints: number[]
}

const convertTrialResponse = (res: TrialResponse): Trial => {
  return {
    trial_id: res.trial_id,
    study_id: res.study_id,
    number: res.number,
    state: res.state,
    values: res.values,
    intermediate_values: res.intermediate_values,
    datetime_start: res.datetime_start
      ? new Date(res.datetime_start)
      : undefined,
    datetime_complete: res.datetime_complete
      ? new Date(res.datetime_complete)
      : undefined,
    params: res.params,
    fixed_params: res.fixed_params,
    user_attrs: res.user_attrs,
    system_attrs: res.system_attrs,
    note: res.note,
    artifacts: res.artifacts,
    constraints: res.constraints,
  }
}

interface StudyDetailResponse {
  name: string
  datetime_start: string
  directions: StudyDirection[]
  trials: TrialResponse[]
  best_trials: TrialResponse[]
  intersection_search_space: SearchSpaceItem[]
  union_search_space: SearchSpaceItem[]
  union_user_attrs: AttributeSpec[]
  has_intermediate_values: boolean
  note: Note
  objective_names?: string[]
  form_widgets?: FormWidgets
}

export const getStudyDetailAPI = (
  studyId: number,
  nLocalTrials: number
): Promise<StudyDetail> => {
  return requestAPI<StudyDetailResponse>(`/api/studies/${studyId}/?after=${nLocalTrials}`, {
      method: 'GET'
    })
    .then((res) => {
      const trials = res.trials.map((trial): Trial => {
        return convertTrialResponse(trial)
      })
      const best_trials = res.best_trials.map((trial): Trial => {
        return convertTrialResponse(trial)
      })
      return {
        id: studyId,
        name: res.name,
        datetime_start: new Date(res.datetime_start),
        directions: res.directions,
        trials: trials,
        best_trials: best_trials,
        union_search_space: res.union_search_space,
        intersection_search_space: res.intersection_search_space,
        union_user_attrs: res.union_user_attrs,
        has_intermediate_values: res.has_intermediate_values,
        note: res.note,
        objective_names: res.objective_names,
        form_widgets: res.form_widgets,
      }
    })
}

interface StudySummariesResponse {
  study_summaries: {
    study_id: number
    study_name: string
    directions: StudyDirection[]
    user_attrs: Attribute[]
    system_attrs: Attribute[]
    datetime_start?: string
  }[]
}

export const getStudySummariesAPI = (): Promise<StudySummary[]> => {
  return requestAPI<StudySummariesResponse>(`/api/studies`)
    .then((res) => {
      return res.study_summaries.map((study): StudySummary => {
        return {
          study_id: study.study_id,
          study_name: study.study_name,
          directions: study.directions,
          user_attrs: study.user_attrs,
          system_attrs: study.system_attrs,
          datetime_start: study.datetime_start
            ? new Date(study.datetime_start)
            : undefined,
        }
      })
    })
}

interface CreateNewStudyResponse {
  study_summary: {
    study_id: number
    study_name: string
    directions: StudyDirection[]
    user_attrs: Attribute[]
    system_attrs: Attribute[]
    datetime_start?: string
  }
}

export const createNewStudyAPI = (
  studyName: string,
  directions: StudyDirection[]
): Promise<StudySummary> => {
  return requestAPI<CreateNewStudyResponse>(`/api/studies`, {
    body: JSON.stringify({
      study_name: studyName,
      directions,
    }),
    method: 'POST',
  })
  .then((res) => {
    const study_summary = res.study_summary
    return {
      study_id: study_summary.study_id,
      study_name: study_summary.study_name,
      directions: study_summary.directions,
      // best_trial: undefined,
      user_attrs: study_summary.user_attrs,
      system_attrs: study_summary.system_attrs,
      datetime_start: study_summary.datetime_start
        ? new Date(study_summary.datetime_start)
        : undefined,
    }
  })
}

export const deleteStudyAPI = (studyId: number): Promise<void> => {
return requestAPI<void>(`/api/studies/${studyId}`, {
    method: 'DELETE'
  }).then(() => {
    return
  })
}

type RenameStudyResponse = {
  study_id: number
  study_name: string
  directions: StudyDirection[]
  user_attrs: Attribute[]
  system_attrs: Attribute[]
  datetime_start?: string
}

export const renameStudyAPI = (
  studyId: number,
  studyName: string
): Promise<StudySummary> => {
  return requestAPI<RenameStudyResponse>(`/api/studies/${studyId}/rename`, {
    body: JSON.stringify({ study_name: studyName }),
    method: 'POST'
  })
  .then((res) => {
    return {
      study_id: res.study_id,
      study_name: res.study_name,
      directions: res.directions,
      user_attrs: res.user_attrs,
      system_attrs: res.system_attrs,
      datetime_start: res.datetime_start
        ? new Date(res.datetime_start)
        : undefined,
    }
  })
}

export const saveStudyNoteAPI = (
  studyId: number,
  note: { version: number; body: string }
): Promise<void> => {
  return requestAPI<void>(`/api/studies/${studyId}/note`, {
    body: JSON.stringify(note),
    method: 'PUT'
  })
  .then(() => {
    return
  })
}

export const saveTrialNoteAPI = (
  studyId: number,
  trialId: number,
  note: { version: number; body: string }
): Promise<void> => {
  return requestAPI<void>(`/api/studies/${studyId}/${trialId}/note`, {
    body: JSON.stringify(note),
    method: 'PUT'
  })
  .then(() => {
    return
  })
}

type UploadArtifactAPIResponse = {
  artifact_id: string
  artifacts: Artifact[]
}

export const uploadArtifactAPI = (
  studyId: number,
  trialId: number,
  fileName: string,
  dataUrl: string
): Promise<UploadArtifactAPIResponse> => {
  return requestAPI<UploadArtifactAPIResponse>(`/api/artifacts/${studyId}/${trialId}`, {
    body: JSON.stringify({
      file: dataUrl,
      filename: fileName,
    }),
    method: 'POST'
  })
  .then((res) => {
    return res
  })
}

export const deleteArtifactAPI = (
  studyId: number,
  trialId: number,
  artifactId: string
): Promise<void> => {
  return requestAPI<void>(`/api/artifacts/${studyId}/${trialId}/${artifactId}`, {
    method: 'DELETE'
  })
  .then(() => {
    return
  })
}

export const tellTrialAPI = (
  trialId: number,
  state: TrialStateFinished,
  values?: number[]
): Promise<void> => {
  const req: { state: TrialState; values?: number[] } = {
    state: state,
    values: values,
  }

  return requestAPI<void>(`/api/trials/${trialId}/tell`, {
    body: JSON.stringify(req),
    method: 'POST'
  })
  .then(() => {
    return
  })
}

export const saveTrialUserAttrsAPI = (
  trialId: number,
  user_attrs: { [key: string]: number | string }
): Promise<void> => {
  const req = { user_attrs: user_attrs }

  return requestAPI<void>(`/api/trials/${trialId}/user-attrs`, {
    body: JSON.stringify(req), 
    method:'POST'
  })
  .then(() => {
    return
  })
}

interface ParamImportancesResponse {
  param_importances: ParamImportance[][]
}

export const getParamImportances = (
  studyId: number
): Promise<ParamImportance[][]> => {
  return requestAPI<ParamImportancesResponse>(`/api/studies/${studyId}/param_importances`)
  .then((res) => {
    return res.param_importances
  })
}

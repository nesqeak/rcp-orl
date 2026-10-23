export type View = 'home' | 'rcp_form' | 'rcp_result' | 'contouring' | 'decision_tree';

export type SituationType = 'tumeur_en_place' | 'adjuvant';

export type LocalisationENT =
  | 'Nasopharynx'
  | 'Sinus de la face (hors ethmoïde)'
  | 'Sinus ethmoïde'
  | 'Fosses nasales'
  | 'Cavité buccale'
  | 'Oropharynx'
  | 'Hypopharynx'
  | 'Larynx'
  | 'Glande salivaire';

export type StadeT = 'Tis' | '1' | '2' | '3' | '4' | 'X';
export type StadeN = '0' | '1' | '1a' | '1b' | '2' | '2a' | '2b' | '2c' | '3' | '3a' | '3b' | 'X';

export type HistologieENT =
  | 'Carcinome épidermoïde'
  | 'ADK'
  | 'UCNT'
  | 'SNUC'
  | 'CAC'
  | 'autre';

export type MargesResection =
  | 'Envahies'
  | 'Envahies mais recoupe négative'
  | '< 5mm'
  | '> 5mm';

export type EffractionCapsulaire = 'Non' | 'Mineure' | 'Majeure';

export type NbGanglionsHpv = '1' | '2 et plus';
export type TailleTumeurT2 = '< 3cm' | '≥ 3cm';

export interface RcpFormTumeurEnPlace {
  situation: 'tumeur_en_place';
  localisation: LocalisationENT;
  stadeT: StadeT;
  stadeN: StadeN;
  statutHPV: boolean;
  nbGanglions?: NbGanglionsHpv;
  histologie: HistologieENT;
  cisplatineEligible: boolean;
  chimiotherapieInduction: boolean;
  atteinteLigneMediane?: boolean;
  nodalAreas?: string[];
}

export interface RcpFormAdjuvant {
  situation: 'adjuvant';
  localisation: LocalisationENT;
  stadePT: StadeT;
  tailleTumeur?: TailleTumeurT2;
  stadePN: StadeN;
  statutHPV: boolean;
  histologie: HistologieENT;
  cisplatineEligible: boolean;
  embolesVasculaires: boolean;
  engainementPerineuronal: boolean;
  WPI: boolean;
  marges: MargesResection;
  effractionExtraCapsulaire: EffractionCapsulaire;
  lambeau: boolean;
  atteinteLigneMediane?: boolean;
  nodalAreas?: string[];
}

export type RcpFormData = RcpFormTumeurEnPlace | RcpFormAdjuvant;

export type DoseProposition =
  | 'Radiothérapie 70Gy'
  | 'Radiothérapie 70Gy potentialisée par du cisplatine 100mg/m2'
  | 'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2'
  | 'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2 ou Radiothérapie 70Gy si réponse > 80%'
  | 'Radiothérapie 70Gy potentialisée par du cetuximab'
  | 'Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2'
  | 'Radiothérapie 64.8Gy (2.4Gy/fx)'
  | 'Radiothérapie 63.6Gy'
  | 'Radiothérapie 63Gy (2.25Gy/fx)'
  | 'Radiothérapie 60.75Gy (2.25Gy/fx)'
  | 'Radiothérapie 60Gy potentialisée par du cisplatine 40mg/m2'
  | 'Radiothérapie 60Gy'
  | 'Radiothérapie STEREO POST OP 36Gy'
  | 'Surveillance';

export interface RcpResultOutput {
  proposition: DoseProposition;
  justification: string[];
  inclusionEssaiNote: string;
  recommendedLocalisation: LocalisationENT;
}

export interface SavedCase {
  id: string;
  date: string;
  patientRef?: string;
  formData: RcpFormData;
  result: RcpResultOutput;
}

export interface OarConstraint {
  name: string;
  doseLimit: string;
  endpoint: string;
  notes: string;
}

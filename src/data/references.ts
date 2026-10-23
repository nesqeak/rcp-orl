export interface ArticleReference {
  id: string;
  title: string;
  authorsOrJournal: string;
  url: string;
  badge: string;
  summaryText: string;
}

export const ARTICLES = {
  stereoPostOp: {
    id: 'jama_stereo_2024',
    title: 'Postoperative Stereotactic Body Radiotherapy for Head and Neck Cancer',
    authorsOrJournal: 'JAMA Network Open (2024)',
    url: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842891',
    badge: 'Recommandations Stéréo Post-Op',
    summaryText:
      'Définit les marges de délimitation CTV HR à 5mm autour de la suture du lambeau et de la zone de résection R1/R0 sans irradiation des aires ganglionnaires prophylactiques.',
  },
  salivaryGland: {
    id: 'green_journal_salivary_2025',
    title: 'ESTRO ACROP / DAHANCA guidelines for postoperative radiotherapy of salivary gland cancers',
    authorsOrJournal: 'Radiotherapy and Oncology / Green Journal (2025)',
    url: 'https://www.thegreenjournal.com/article/S0167-8140(25)05321-6/fulltext',
    badge: 'Glandes Salivaires Post-Op 2025',
    summaryText:
      'Recommandations internationales pour le contourage du CTV T (loge, trajet des nerfs, lambeau) et du CTV N dans les tumeurs des glandes salivaires.',
  },
  nasopharynx: {
    id: 'nasopharynx_ijrobp_2024',
    title: 'International Consensus Guidelines for Target Volume Definition in Nasopharyngeal Carcinoma',
    authorsOrJournal: 'IJROBP / ScienceDirect (2024/2025)',
    url: 'https://www.sciencedirect.com/science/article/pii/S0360301625004870#fig0002',
    badge: 'Nasopharynx Consensus 2024',
    summaryText:
      'Directives internationales 2024 pour le CTV-GTV0mm, l’extension anatomique osseuse aux trous de la base du crâne et les niveaux ganglionnaires rétropharyngés.',
  },
  biauNodal: {
    id: 'biau_nodal_2019',
    title:
      'Selection and delineation of lymph node target volumes in head and neck cancer: DAHANCA, EORTC, GORTEC, HKNPCSG, NCIC CTG, RTOG consensus',
    authorsOrJournal: 'Biau et al. - Radiotherapy and Oncology (2019)',
    url: 'https://www.sciencedirect.com/science/article/pii/S0167814019300234?via%3Dihub',
    badge: 'Consensus Ganglionnaire Biau 2019',
    summaryText:
      'Atlas de référence pour la sélection et le contourage des niveaux ganglionnaires I à VI selon la localisation tumorale initiale et le statut N.',
  },
  recorad: {
    id: 'recorad_2025',
    title:
      'Recommandations RECORAD pour la définition des volumes cibles microscopiques et prophylactiques en radiothérapie ORL',
    authorsOrJournal: 'Cancer / Radiothérapie - Société Française de Radiothérapie Oncologique (SFRO)',
    url: 'https://www.sciencedirect.com/journal/cancer-radiotherapie/vol/29/issue/7',
    badge: 'Consensus RECORAD',
    summaryText:
      'Guide anatomique pour l’inclusion des sous-structures adjacentes et du lambeau de reconstruction dans le CTV T BR.',
  },
} satisfies Record<string, ArticleReference>;

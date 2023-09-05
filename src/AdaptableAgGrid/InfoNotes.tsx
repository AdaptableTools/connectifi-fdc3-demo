import * as React from 'react';

export const InfoNotes = () => {
  return (
    <div className={'h-full overflow-auto'}>
      {' '}
      <p>
        <b>AdapTable & Connectifi FDC3 Demo Application</b>
      </p>
      <br />
      <div className={'text-sm'}>
        <p>
          This app leverages the Connectifi sandbox (and uses random, meaningless dummy data) to illustrate some of
          AdapTable's FDC3 features:
        </p>
        <br />
        <p>
          Learn more about{' '}
          <a
            className={'text-sky-400 underline'}
            href="https://docs.adaptabletools.com/guide/handbook-fdc3"
            target="_new"
          >
            AdapTable's FDC3 capabilites
          </a>{' '}
        </p>{' '}
        <br />
        <p className={'text-green-400'}>
          Raising FDC3 Intents (using buttons in the "FDC3 Actions" column)
        </p>
        <p>
          * Blue button - Raises <i>ViewChart</i> Intent
        </p>
        <p>
          * Orange button - Raises <i>ViewNews</i> Intent
        </p>
        <p>
          * Red button - Raises <i>ViewInstrument</i> Intent
        </p>
        <br />
        <p className={'text-green-400'}>
          Broadcasting Context (using buttons in the "FDC3 Actions" column)
        </p>
        <p>Green button - Broadcasts Context about the row's Instrument</p>
        <br />
        <p className={'text-green-400'}>Listening for Raised Intents</p>
        <p>
          When <i>ViewInstrument</i> Intent is received, app jumps to the row
          and highlights it in yellow
        </p>
        <br />
        <p className={'text-green-400'}>
          Listen for Custom FDC3 Intents (using buttons in the Get Price" column)
        </p>
        <p>
          The button in the column calls the Custom <i>GetPrice</i> Intent and
          displays the result
        </p>
        <br />
        <p className={'text-green-400'}>Listening for Broacdast Context</p>
        <p>
          When broadcast <i>Instrument Context</i> is received, the app filters
          the Grid to that Instrument
        </p>
        <br />
        <p>
          <i>
            (We output content of Intents and Broadcasts we listen for as System
            Status messages)
          </i>
        </p>
      </div>
    </div>
  );
};

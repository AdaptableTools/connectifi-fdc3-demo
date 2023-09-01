import * as React from 'react';

export const InfoNotes = () => {
  return (
    <div className={'h-full overflow-auto'}>
      {' '}
      <h1>AdapTable & Connectifi FDC3 Demo</h1>
      <br />
      <div className={'text-sm'}>
        <p>
          This demo app illustrates some of the FDC3 features in AdapTable
          including:
        </p>
        <br />
        <p className={'text-green-400'}>Raising FDC3 Intents</p>
        <p>
          The Blue, Orange and Red buttons in the "FDC3 Actions" column raise
          the <i>ViewChart</i>, <i>ViewNews</i> and <i>ViewInstruments</i>{' '}
          Intents respectively.
        </p>
        <br />
        <p className={'text-green-400'}>Broadcasting Context</p>
        <p>
          The Green "Broadcast Instrument" button in the "FDC3 Actions" Column
          broadcasts Context about the current Instrument.
        </p>
        <br />
        <p className={'text-green-400'}>Listening to Raised Intents</p>
        <p>
          When the ViewInstrument intent is received, the app jumps to the row
          and highlights it in yellow
        </p>
        <br />
        <p className={'text-green-400'}>Listen to Custom FDC3 Intents</p>
        <p>
          The button in the "Get Price" Column calls the Custom <i>GetPrice</i>{' '}
          Intent and displays the result
        </p>
        <br />
        <p className={'text-green-400'}>Listening to Broacdast Context</p>
        <p>
          When broadcast Instrument Context is received, the app filters to that
          Instrument
        </p>
        <br />
        <p>
          <i>
            (Note: We output content of Intents and Broadcasts we listen to as
            System Status messages)
          </i>
        </p>
        <br />
        <p className={'text-sky-400 underline'}>
          Learn more about{' '}
          <a
            href="https://docs.adaptabletools.com/guide/handbook-fdc3"
            target="_new"
          >
            AdapTable's FDC3 capabilites
          </a>{' '}
        </p>
      </div>
    </div>
  );
};
